from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, SupplierProfile, Product, Order, RFQ, Conversation, Message

class Command(BaseCommand):
    help = 'Seed demo data for Steel Platform'

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(username='admin@steelplatform.com', defaults={'email':'admin@steelplatform.com', 'first_name':'Admin'})
        admin.set_password('Admin123!')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        UserProfile.objects.get_or_create(user=admin, defaults={'role':'admin', 'company':'Steel Platform', 'city':'Dammam'})

        supplier, _ = User.objects.get_or_create(username='supplier@steelplatform.com', defaults={'email':'supplier@steelplatform.com', 'first_name':'Saudi', 'last_name':'Steel'})
        supplier.set_password('Supplier123!')
        supplier.save()
        UserProfile.objects.get_or_create(user=supplier, defaults={'role':'supplier', 'company':'Saudi Steel Industries', 'city':'Dammam', 'phone':'0500000001'})
        SupplierProfile.objects.get_or_create(user=supplier, defaults={
            'description':'Leading supplier of structural steel, coils, pipes, and rebar across Saudi Arabia.',
            'categories':['Steel Sheets', 'Steel Coils', 'Steel Pipes', 'Rebar', 'Steel Beams'],
            'rating':4.7,
            'total_orders':128,
            'image':'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800'
        })

        buyer, _ = User.objects.get_or_create(username='buyer@steelplatform.com', defaults={'email':'buyer@steelplatform.com', 'first_name':'Ahmed', 'last_name':'Al Mansour'})
        buyer.set_password('Buyer123!')
        buyer.save()
        UserProfile.objects.get_or_create(user=buyer, defaults={'role':'buyer', 'company':'Al-Khozama Construction', 'city':'Riyadh', 'phone':'0500000002'})

        products = [
            {
                'name':'Hot Rolled Steel Sheets', 'category':'Steel Sheets', 'price':2750, 'moq':5, 'unit':'ton', 'delivery_time':'3-5 days',
                'description':'High-quality hot rolled steel sheets suitable for structural and fabrication use.', 'inventory':320,
                'specifications':{'grade':'A36','thickness':'6mm','width':'1500mm','length':'6000mm'},
                'image':'https://images.unsplash.com/photo-1720036236694-d0a231c52563?w=800', 'stock_status':'In Stock', 'badge':'Best Seller', 'status':'approved'
            },
            {
                'name':'Galvanized Steel Coils', 'category':'Steel Coils', 'price':3100, 'moq':3, 'unit':'ton', 'delivery_time':'5-7 days',
                'description':'Durable galvanized steel coils with excellent corrosion resistance.', 'inventory':180,
                'specifications':{'grade':'DX51D','thickness':'1.2mm','width':'1250mm','coating':'Z120'},
                'image':'https://images.unsplash.com/photo-1720036237038-802f50cdfd9c?w=800', 'stock_status':'In Stock', 'badge':'New', 'status':'pending'
            },
            {
                'name':'Construction Rebar', 'category':'Rebar', 'price':2450, 'moq':10, 'unit':'ton', 'delivery_time':'2-4 days',
                'description':'Reliable construction rebar for reinforced concrete applications.', 'inventory':90,
                'specifications':{'grade':'B500B','length':'12m'},
                'image':'https://images.unsplash.com/photo-1763263385516-953ae09448f7?w=800', 'stock_status':'Low Stock', 'status':'approved'
            },
        ]
        for p in products:
            Product.objects.get_or_create(name=p['name'], supplier=supplier, defaults=p)

        order, _ = Order.objects.get_or_create(
            buyer=buyer, supplier=supplier, product_name='Hot Rolled Steel Sheets', defaults={'quantity':12, 'total':33000, 'status':'processing', 'shipping_address':'Riyadh Industrial Area'}
        )
        Order.objects.get_or_create(
            buyer=buyer, supplier=supplier, product_name='Construction Rebar', defaults={'quantity':20, 'total':49000, 'status':'shipped', 'shipping_address':'Riyadh Industrial Area'}
        )
        RFQ.objects.get_or_create(buyer=buyer, supplier=supplier, product_name='Steel Beams', defaults={'quantity':15, 'unit':'ton', 'target_price':42000, 'status':'pending'})
        conv, _ = Conversation.objects.get_or_create(buyer=buyer, supplier=supplier)
        if not conv.messages.exists():
            Message.objects.create(conversation=conv, sender=buyer, sender_role='buyer', content='Hello, I need a quotation for 15 tons of steel beams.')
            Message.objects.create(conversation=conv, sender=supplier, sender_role='supplier', content='Certainly. We can provide a formal quotation today.')
        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
