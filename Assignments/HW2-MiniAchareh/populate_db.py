import os
import django
import random
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mini_achareh.settings')
django.setup()

from api.models import User, Advertisement, Bid, Comment, Ticket

def create_users():
    print("Creating users...")
    
    # Admin
    admin, created = User.objects.get_or_create(
        username='admin', 
        defaults={'email': 'admin@example.com', 'role': User.Role.ADMIN}
    )
    if created:
        admin.set_password('admin123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print(f"Created Admin: {admin.username}")
    else:
        print(f"Admin already exists: {admin.username}")

    # Support
    support, created = User.objects.get_or_create(
        username='support', 
        defaults={'email': 'support@example.com', 'role': User.Role.SUPPORT}
    )
    if created:
        support.set_password('support123')
        support.save()
        print(f"Created Support: {support.username}")
    else:
        print(f"Support already exists: {support.username}")

    # Customers
    customers = []
    for i in range(1, 4):
        customer, created = User.objects.get_or_create(
            username=f'customer{i}', 
            defaults={'email': f'customer{i}@example.com', 'role': User.Role.CUSTOMER}
        )
        if created:
            customer.set_password('customer123')
            customer.save()
            print(f"Created Customer: {customer.username}")
        else:
            print(f"Customer already exists: {customer.username}")
        customers.append(customer)

    # Contractors
    contractors = []
    for i in range(1, 4):
        contractor, created = User.objects.get_or_create(
            username=f'contractor{i}', 
            defaults={'email': f'contractor{i}@example.com', 'role': User.Role.CONTRACTOR}
        )
        if created:
            contractor.set_password('contractor123')
            contractor.save()
            print(f"Created Contractor: {contractor.username}")
        else:
            print(f"Contractor already exists: {contractor.username}")
        contractors.append(contractor)

    return customers, contractors

def create_advertisements(customers, contractors):
    print("\nCreating advertisements...")
    
    titles = ["Fix leaking pipe", "Paint living room", "Repair AC", "Clean house", "Move furniture"]
    descriptions = ["Urgent help needed", "Need professional service", "Looking for best price", "Small job", "Full day work"]
    
    ads = []
    
    # Open Ads
    for i in range(3):
        ad = Advertisement.objects.create(
            title=f"{random.choice(titles)} {i}",
            description=random.choice(descriptions),
            category="Home Improvement",
            owner=random.choice(customers),
            status=Advertisement.Status.OPEN
        )
        print(f"Created Open Ad: {ad.title} by {ad.owner.username}")
        ads.append(ad)

    # Assigned Ads
    for i in range(2):
        contractor = random.choice(contractors)
        ad = Advertisement.objects.create(
            title=f"{random.choice(titles)} (Assigned) {i}",
            description=random.choice(descriptions),
            category="Repairs",
            owner=random.choice(customers),
            status=Advertisement.Status.ASSIGNED,
            assigned_contractor=contractor,
            execution_time=timezone.now() + timedelta(days=random.randint(1, 5)),
            location="Tehran, Valiasr St."
        )
        # Create a bid for this assignment
        Bid.objects.get_or_create(advertisement=ad, contractor=contractor)
        print(f"Created Assigned Ad: {ad.title} assigned to {contractor.username}")
        ads.append(ad)

    # Done Ads
    for i in range(2):
        contractor = random.choice(contractors)
        customer = random.choice(customers)
        ad = Advertisement.objects.create(
            title=f"{random.choice(titles)} (Done) {i}",
            description=random.choice(descriptions),
            category="Cleaning",
            owner=customer,
            status=Advertisement.Status.DONE,
            assigned_contractor=contractor,
            contractor_done=True,
            customer_confirmed=True,
            execution_time=timezone.now() - timedelta(days=random.randint(1, 5)),
            location="Tehran, Azadi Sq."
        )
        Bid.objects.get_or_create(advertisement=ad, contractor=contractor)
        
        # Add comment
        Comment.objects.create(
            text="Great job! Very professional.",
            score=random.randint(3, 5),
            author=customer,
            advertisement=ad,
            contractor=contractor
        )
        print(f"Created Done Ad: {ad.title} by {contractor.username} with comment")
        ads.append(ad)

    return ads

def create_bids(ads, contractors):
    print("\nCreating bids...")
    open_ads = [ad for ad in ads if ad.status == Advertisement.Status.OPEN]
    
    for ad in open_ads:
        # 1 or 2 contractors bid on each open ad
        bidders = random.sample(contractors, k=random.randint(1, len(contractors)))
        for bidder in bidders:
            Bid.objects.get_or_create(advertisement=ad, contractor=bidder)
            print(f"Created Bid: {bidder.username} on {ad.title}")

def create_tickets(customers):
    print("\nCreating tickets...")
    customer = customers[0]
    
    Ticket.objects.create(
        title="Login issue",
        message="I cannot login to my account sometimes.",
        author=customer,
        status=Ticket.Status.OPEN
    )
    print(f"Created Ticket: Login issue by {customer.username}")

    Ticket.objects.create(
        title="Payment problem",
        message="Payment gateway gave an error.",
        response="We are checking it.",
        author=customer,
        status=Ticket.Status.CLOSED
    )
    print(f"Created Ticket: Payment problem (Closed)")

if __name__ == "__main__":
    print("Starting population script...")
    customers, contractors = create_users()
    ads = create_advertisements(customers, contractors)
    create_bids(ads, contractors)
    create_tickets(customers)
    print("\nDone! Database populated with test data.")
