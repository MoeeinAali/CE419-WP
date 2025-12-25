from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'customer', _('Customer')
        CONTRACTOR = 'contractor', _('Contractor')
        SUPPORT = 'support', _('Support')
        ADMIN = 'admin', _('Admin')

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    email = models.EmailField(_('email address'), unique=True)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class Advertisement(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', _('Open')
        ASSIGNED = 'assigned', _('Assigned')
        DONE = 'done', _('Done')
        CANCELLED = 'cancelled', _('Cancelled')

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='advertisements')
    assigned_contractor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_jobs')
    
    execution_time = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)

    contractor_done = models.BooleanField(default=False)
    customer_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Bid(models.Model):
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='bids')
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('advertisement', 'contractor')

    def __str__(self):
        return f"{self.contractor} -> {self.advertisement}"

class Comment(models.Model):
    text = models.TextField()
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments_written')
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='comments')
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments_received')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.contractor}"

class Ticket(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', _('Open')
        IN_PROGRESS = 'in_progress', _('In Progress')
        CLOSED = 'closed', _('Closed')

    title = models.CharField(max_length=255)
    message = models.TextField()
    response = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    related_advertisement = models.ForeignKey(Advertisement, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

