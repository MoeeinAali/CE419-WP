from rest_framework import viewsets, permissions, status, filters, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.contrib.auth import authenticate, login, logout
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from datetime import timedelta
from .models import User, Advertisement, Bid, Comment, Ticket
from .serializers import UserSerializer, AdvertisementSerializer, BidSerializer, CommentSerializer, TicketSerializer, LoginSerializer, ChangeRoleSerializer
from .permissions import IsCustomer, IsContractor, IsSupport, IsAdmin, IsOwnerOrReadOnly, IsOwnerOrAssignedContractor, IsSelfOrSupportOrAdmin
from .filters import ContractorFilter, CommentFilter


def check_contractor_time_conflict(contractor, execution_time, exclude_ad_id=None):
    if not execution_time:
        return False, None

    time_buffer = timedelta(hours=2)
    start_time = execution_time - time_buffer
    end_time = execution_time + time_buffer

    conflicting_ads = Advertisement.objects.filter(
        assigned_contractor=contractor,
        status__in=[Advertisement.Status.ASSIGNED, Advertisement.Status.OPEN],
        execution_time__isnull=False,
        execution_time__range=(start_time, end_time)
    )

    if exclude_ad_id:
        conflicting_ads = conflicting_ads.exclude(id=exclude_ad_id)

    conflicting_ad = conflicting_ads.first()
    return conflicting_ad is not None, conflicting_ad


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: UserSerializer, 401: None}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return Response(UserSerializer(user).data)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(views.APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action == 'list':
            return [IsAdmin()]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsSelfOrSupportOrAdmin()]
        if self.action in ['destroy']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        user = self.get_object()
        requester = request.user
        if requester.role not in (User.Role.ADMIN, User.Role.SUPPORT):
            if requester.role == User.Role.CUSTOMER:
                if not (user.role == User.Role.CONTRACTOR or user == requester):
                    return Response({"detail": "Not allowed to view this profile."}, status=status.HTTP_403_FORBIDDEN)
            elif requester.role == User.Role.CONTRACTOR:
                if user.role != User.Role.CONTRACTOR:
                    return Response({"detail": "Not allowed to view this profile."}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({"detail": "Not allowed to view this profile."}, status=status.HTTP_403_FORBIDDEN)
        if user.role == User.Role.CONTRACTOR:
            comments = Comment.objects.filter(
                contractor=user).order_by('-created_at')
            avg_score = comments.aggregate(Avg('score'))['score__avg']
            done_ads_count = Advertisement.objects.filter(
                assigned_contractor=user, status=Advertisement.Status.DONE).count()
            in_progress_count = Advertisement.objects.filter(
                assigned_contractor=user, status=Advertisement.Status.ASSIGNED).count()
            not_done_count = Advertisement.objects.filter(
                assigned_contractor=user).exclude(status=Advertisement.Status.DONE).count()
            serializer = self.get_serializer(user)
            data = serializer.data
            data['avg_score'] = avg_score
            data['done_ads_count'] = done_ads_count
            data['in_progress_count'] = in_progress_count
            data['not_done_count'] = not_done_count
            data['comments'] = CommentSerializer(comments, many=True).data
            return Response(data)
        elif user.role == User.Role.CUSTOMER:
            ads = Advertisement.objects.filter(owner=user)
            serializer = self.get_serializer(user)
            data = serializer.data
            data['ads'] = AdvertisementSerializer(ads, many=True).data
            return Response(data)
        return Response(self.get_serializer(user).data)

    @action(detail=False, methods=['get'])
    def contractors(self, request):
        """
        Filter Query parameters:
        - min_score
        - min_comments:
        - ordering: comments or avg_score
        """
        queryset = User.objects.filter(role=User.Role.CONTRACTOR)

        queryset = queryset.annotate(
            avg_score=Avg('comments_received__score'),
            comment_count=Count('comments_received')
        )

        filterset = ContractorFilter(request.query_params, queryset=queryset)
        queryset = filterset.qs

        sort_by = request.query_params.get('ordering')
        if sort_by == 'score':
            queryset = queryset.order_by('-avg_score')
        elif sort_by == 'comments':
            queryset = queryset.order_by('-comment_count')

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        for i, contractor in enumerate(queryset):
            data[i]['avg_score'] = contractor.avg_score
            data[i]['comment_count'] = contractor.comment_count

        return Response(data)

    @extend_schema(request=ChangeRoleSerializer)
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def change_role(self, request, pk=None):
        user = self.get_object()
        serializer = ChangeRoleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_role = serializer.validated_data['role']
        user.role = new_role
        user.save()
        return Response({"status": "role updated", "role": user.role})

    @action(detail=False, methods=['get'], permission_classes=[IsContractor])
    def schedule(self, request):
        if request.user.role != User.Role.CONTRACTOR:
            return Response({"error": "Only contractors can access schedule"}, status=status.HTTP_403_FORBIDDEN)

        ads = Advertisement.objects.filter(
            assigned_contractor=request.user,
            status=Advertisement.Status.ASSIGNED,
            execution_time__isnull=False
        ).order_by('execution_time')

        date_str = request.query_params.get('date')
        if date_str:
            ads = ads.filter(execution_time__date=date_str)

        serializer = AdvertisementSerializer(ads, many=True)
        return Response(serializer.data)


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAuthenticated,
                          IsOwnerOrAssignedContractor]

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CUSTOMER:
            raise permissions.PermissionDenied(
                "Only customers can create advertisements.")
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        ad = self.get_object()
        if self.request.user == ad.assigned_contractor:
            allowed_fields = {'execution_time', 'location'}
            if not set(serializer.validated_data.keys()).issubset(allowed_fields):
                raise permissions.PermissionDenied(
                    "Contractor can only update execution_time and location.")

            if 'execution_time' in serializer.validated_data:
                new_execution_time = serializer.validated_data['execution_time']
                if new_execution_time:
                    has_conflict, conflicting_ad = check_contractor_time_conflict(
                        ad.assigned_contractor,
                        new_execution_time,
                        exclude_ad_id=ad.id
                    )
                    if has_conflict:
                        raise permissions.PermissionDenied(
                            f"Time conflict with another assignment: {conflicting_ad.title} "
                            f"at {conflicting_ad.execution_time}"
                        )
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer, IsOwnerOrReadOnly])
    def assign(self, request, pk=None):
        ad = self.get_object()
        contractor_id = request.data.get('contractor_id')
        try:
            contractor = User.objects.get(
                id=contractor_id, role=User.Role.CONTRACTOR)
        except User.DoesNotExist:
            return Response({"error": "Contractor not found"}, status=status.HTTP_404_NOT_FOUND)

        if not Bid.objects.filter(advertisement=ad, contractor=contractor).exists():
            return Response({"error": "Contractor has not applied for this ad"}, status=status.HTTP_400_BAD_REQUEST)

        if ad.execution_time:
            has_conflict, conflicting_ad = check_contractor_time_conflict(
                contractor, ad.execution_time, exclude_ad_id=ad.id)
            if has_conflict:
                return Response({
                    "error": "Contractor has a time conflict with another assignment",
                    "conflicting_ad_id": conflicting_ad.id,
                    "conflicting_ad_title": conflicting_ad.title,
                    "conflicting_execution_time": conflicting_ad.execution_time
                }, status=status.HTTP_400_BAD_REQUEST)

        ad.assigned_contractor = contractor
        ad.status = Advertisement.Status.ASSIGNED
        ad.save()
        return Response({"status": "assigned"})

    @action(detail=True, methods=['post'], permission_classes=[IsContractor])
    def mark_done(self, request, pk=None):
        ad = self.get_object()
        if ad.assigned_contractor != request.user:
            return Response({"error": "You are not the assigned contractor"}, status=status.HTTP_403_FORBIDDEN)
        ad.contractor_done = True
        ad.save()
        return Response({"status": "marked as done by contractor"})

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer, IsOwnerOrReadOnly])
    def confirm_done(self, request, pk=None):
        ad = self.get_object()
        if not ad.contractor_done:
            return Response({"error": "Contractor has not marked as done yet"}, status=status.HTTP_400_BAD_REQUEST)
        ad.customer_confirmed = True
        ad.status = Advertisement.Status.DONE
        ad.save()
        return Response({"status": "confirmed done"})

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer, IsOwnerOrReadOnly])
    def cancel(self, request, pk=None):
        ad = self.get_object()
        if ad.status == Advertisement.Status.DONE:
            return Response({"error": "Cannot cancel done ad"}, status=status.HTTP_400_BAD_REQUEST)
        ad.status = Advertisement.Status.CANCELLED
        ad.save()
        return Response({"status": "cancelled"})


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractor]

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CONTRACTOR:
            raise permissions.PermissionDenied("Only contractors can bid.")

        advertisement = serializer.validated_data.get('advertisement')
        if advertisement is None:
            serializer.save(contractor=self.request.user)
            return

        if Bid.objects.filter(advertisement=advertisement, contractor=self.request.user).exists():
            raise permissions.PermissionDenied(
                "You have already placed a bid on this advertisement.")

        serializer.save(contractor=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.CONTRACTOR:
            return Bid.objects.filter(contractor=user)
        elif user.role == User.Role.CUSTOMER:
            return Bid.objects.filter(advertisement__owner=user)
        return Bid.objects.none()


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = CommentFilter
    ordering_fields = ['score', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CUSTOMER:
            raise permissions.PermissionDenied("Only customers can comment.")
        ad = serializer.validated_data['advertisement']
        if ad.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You can only comment on your own ads.")
        if ad.status != Advertisement.Status.DONE:
            raise permissions.PermissionDenied("Ad must be done to comment.")

        serializer.save(author=self.request.user)


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.SUPPORT:
            return Ticket.objects.all()
        return Ticket.objects.filter(author=user)

    @action(detail=True, methods=['post'], permission_classes=[IsSupport])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        response_text = request.data.get('response')
        if not response_text:
            return Response({"error": "Response text required"}, status=status.HTTP_400_BAD_REQUEST)
        ticket.response = response_text
        ticket.status = Ticket.Status.CLOSED
        ticket.save()
        return Response({"status": "replied"})
