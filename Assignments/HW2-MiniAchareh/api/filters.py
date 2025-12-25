from django_filters import rest_framework as filters
from django.db.models import Avg, Count
from .models import User, Comment


class ContractorFilter(filters.FilterSet):
    min_score = filters.NumberFilter(
        method='filter_min_score', label='Minimum Average Score')
    min_comments = filters.NumberFilter(
        method='filter_min_comments', label='Minimum Comment Count')

    class Meta:
        model = User
        fields = ['min_score', 'min_comments']

    def filter_min_score(self, queryset, name, value):
        return queryset.annotate(
            avg_score=Avg('comments_received__score')
        ).filter(avg_score__gte=value)

    def filter_min_comments(self, queryset, name, value):
        return queryset.annotate(
            comment_count=Count('comments_received')
        ).filter(comment_count__gte=value)


class CommentFilter(filters.FilterSet):
    contractor_id = filters.NumberFilter(
        field_name='contractor__id', label='Contractor ID')
    min_score = filters.NumberFilter(
        field_name='score', lookup_expr='gte', label='Minimum Score')
    max_score = filters.NumberFilter(
        field_name='score', lookup_expr='lte', label='Maximum Score')

    class Meta:
        model = Comment
        fields = ['contractor_id', 'min_score', 'max_score']
