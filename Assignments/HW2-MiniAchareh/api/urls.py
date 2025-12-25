from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, AdvertisementViewSet, BidViewSet, CommentViewSet, TicketViewSet, LoginView, LogoutView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'advertisements', AdvertisementViewSet)
router.register(r'bids', BidViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'tickets', TicketViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
