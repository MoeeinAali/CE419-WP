from rest_framework import viewsets, permissions, status, filters, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.contrib.auth import authenticate, login, logout
from drf_spectacular.utils import extend_schema
from .models import User, Advertisement, Bid, Comment, Ticket
from .serializers import UserSerializer, AdvertisementSerializer, BidSerializer, CommentSerializer, TicketSerializer, LoginSerializer, ChangeRoleSerializer
from .permissions import IsCustomer, IsContractor, IsSupport, IsAdmin, IsOwnerOrReadOnly, IsOwnerOrAssignedContractor, IsSelfOrSupportOrAdmin

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
                return Response({'message': 'Login successful', 'user': UserSerializer(user).data})
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
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsSelfOrSupportOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        user = self.get_object()
        if user.role == User.Role.CONTRACTOR:
            # Contractor profile: show stats
            comments = Comment.objects.filter(contractor=user).order_by('-created_at')
            avg_score = comments.aggregate(Avg('score'))['score__avg']
            done_ads_count = Advertisement.objects.filter(assigned_contractor=user, status=Advertisement.Status.DONE).count()
            serializer = self.get_serializer(user)
            data = serializer.data
            data['avg_score'] = avg_score
            data['done_ads_count'] = done_ads_count
            data['comments'] = CommentSerializer(comments, many=True).data
            return Response(data)
        elif user.role == User.Role.CUSTOMER:
            # Customer profile: show ads
            ads = Advertisement.objects.filter(owner=user)
            serializer = self.get_serializer(user)
            data = serializer.data
            data['ads'] = AdvertisementSerializer(ads, many=True).data
            return Response(data)
        return Response(self.get_serializer(user).data)

    @action(detail=False, methods=['get'])
    def contractors(self, request):
        # Filter and sort contractors
        queryset = User.objects.filter(role=User.Role.CONTRACTOR)
        
        min_score = request.query_params.get('min_score')
        min_comments = request.query_params.get('min_comments')
        sort_by = request.query_params.get('sort_by') # 'score' or 'comments'

        queryset = queryset.annotate(
            avg_score=Avg('comments_received__score'),
            comment_count=Count('comments_received')
        )

        if min_score:
            queryset = queryset.filter(avg_score__gte=min_score)
        if min_comments:
            queryset = queryset.filter(comment_count__gte=min_comments)
        
        if sort_by == 'score':
            queryset = queryset.order_by('-avg_score')
        elif sort_by == 'comments':
            queryset = queryset.order_by('-comment_count')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(request=ChangeRoleSerializer)
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def change_role(self, request, pk=None):
        user = self.get_object()
        serializer = ChangeRoleSerializer(data=request.data)
        if not serializer.is_valid():
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_role = serializer.validated_data['role']
        
        # Additional checks if needed (e.g. Support can only make Contractors)
        # For now, only Admin can access this endpoint as per permission_classes=[IsAdmin]
        
        user.role = new_role
        user.save()
        return Response({"status": "role updated", "role": user.role})

    @action(detail=False, methods=['get'], permission_classes=[IsContractor])
    def schedule(self, request):
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
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAssignedContractor]

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CUSTOMER:
             raise permissions.PermissionDenied("Only customers can create advertisements.")
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        ad = self.get_object()
        if self.request.user == ad.assigned_contractor:
            allowed_fields = {'execution_time', 'location'}
            if not set(serializer.validated_data.keys()).issubset(allowed_fields):
                 raise permissions.PermissionDenied("Contractor can only update execution_time and location.")
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer, IsOwnerOrReadOnly])
    def assign(self, request, pk=None):
        ad = self.get_object()
        contractor_id = request.data.get('contractor_id')
        try:
            contractor = User.objects.get(id=contractor_id, role=User.Role.CONTRACTOR)
        except User.DoesNotExist:
            return Response({"error": "Contractor not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if contractor applied
        if not Bid.objects.filter(advertisement=ad, contractor=contractor).exists():
             return Response({"error": "Contractor has not applied for this ad"}, status=status.HTTP_400_BAD_REQUEST)

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
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CONTRACTOR:
            raise permissions.PermissionDenied("Only contractors can bid.")
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

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CUSTOMER:
            raise permissions.PermissionDenied("Only customers can comment.")
        
        # Validate that the customer is the owner of the ad and the ad is done
        ad = serializer.validated_data['advertisement']
        if ad.owner != self.request.user:
             raise permissions.PermissionDenied("You can only comment on your own ads.")
        if ad.status != Advertisement.Status.DONE:
             raise permissions.PermissionDenied("Ad must be done to comment.")
        
        serializer.save(author=self.request.user)

    def get_queryset(self):
        # Filter by contractor if provided
        queryset = Comment.objects.all()
        contractor_id = self.request.query_params.get('contractor_id')
        if contractor_id:
            queryset = queryset.filter(contractor_id=contractor_id)
        
        min_score = self.request.query_params.get('min_score')
        if min_score:
            queryset = queryset.filter(score__gte=min_score)
            
        return queryset

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
