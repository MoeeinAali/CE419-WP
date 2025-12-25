from rest_framework import serializers
from .models import User, Advertisement, Bid, Comment, Ticket

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ChangeRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=User.Role.choices)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class AdvertisementSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = Advertisement
        fields = '__all__'
        read_only_fields = ['status', 'assigned_contractor', 'contractor_done', 'customer_confirmed', 'created_at']

class BidSerializer(serializers.ModelSerializer):
    contractor = serializers.ReadOnlyField(source='contractor.username')

    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ['created_at']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['created_at']

class TicketSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'response', 'status']
