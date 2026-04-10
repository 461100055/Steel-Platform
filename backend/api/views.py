from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.db.models import Count, Sum

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Order, Product, RFQ, UserProfile
from .serializers import (
    AdminOrderUpdateSerializer,
    AdminProductUpdateSerializer,
    AdminRFQUpdateSerializer,
    AdminUserUpdateSerializer,
    OrderSerializer,
    ProductSerializer,
    RegisterSerializer,
    RFQSerializer,
    UserSerializer,
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def get_user_profile(user):
    try:
        return user.profile
    except Exception:
        return None


def get_user_role(user):
    profile = get_user_profile(user)
    if not profile:
        return ""
    return profile.role or ""


def get_user_permissions(user):
    profile = get_user_profile(user)
    if not profile:
        return []

    permissions = getattr(profile, "permissions", []) or []
    return permissions if isinstance(permissions, list) else []


def is_supplier_or_admin(user):
    role = get_user_role(user)
    return role in ["supplier", "admin"]


def is_buyer_role(user):
    role = get_user_role(user)
    return role in ["buyer", "buyer_individual", "buyer_company", "buyer_establishment", "admin"]


def is_admin(user):
    return get_user_role(user) == "admin"


def admin_has_permission(user, permission_code):
    if not is_admin(user):
        return False

    permissions = get_user_permissions(user)

    # إذا كان الأدمن بدون permissions مسجلة، نسمح له كـ fallback
    # حتى لا تتعطل لوحة التحكم في بيئات التطوير أو البيانات القديمة
    if not permissions:
        return True

    return permission_code in permissions


def get_user_or_404(pk):
    try:
        return User.objects.select_related("profile").get(pk=pk)
    except User.DoesNotExist:
        return None


def get_product_or_404(pk):
    try:
        return Product.objects.select_related("supplier").get(pk=pk)
    except Product.DoesNotExist:
        return None


def get_order_or_404(pk):
    try:
        return Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return None


def get_rfq_or_404(pk):
    try:
        return RFQ.objects.select_related("buyer", "supplier").get(pk=pk)
    except RFQ.DoesNotExist:
        return None


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            return Response(
                {
                    "message": "Registration successful.",
                    "user": UserSerializer(user).data,
                    "tokens": tokens,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = (request.data.get("password") or "").strip()

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_obj = User.objects.get(email__iexact=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(request, username=username, password=password)

        if not user:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = (request.query_params.get("email") or "").strip().lower()

        if not email:
            return Response(
                {"exists": False, "message": "No email provided."},
                status=status.HTTP_200_OK,
            )

        exists = User.objects.filter(email__iexact=email).exists()
        return Response({"exists": exists}, status=status.HTTP_200_OK)

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()

        if not email:
            return Response(
                {"exists": False, "message": "No email provided."},
                status=status.HTTP_200_OK,
            )

        exists = User.objects.filter(email__iexact=email).exists()
        return Response({"exists": exists}, status=status.HTTP_200_OK)


class ProductListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_active=True, status="approved").order_by("-id")
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not is_supplier_or_admin(request.user):
            return Response(
                {"detail": "Only suppliers or admin can create products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProductSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_supplier_or_admin(request.user):
            return Response(
                {"detail": "Only suppliers or admin can update products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if getattr(product, "supplier_id", None) != request.user.id and not is_admin(request.user):
            return Response(
                {"detail": "You do not have permission to update this product."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=False,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_supplier_or_admin(request.user):
            return Response(
                {"detail": "Only suppliers or admin can update products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if getattr(product, "supplier_id", None) != request.user.id and not is_admin(request.user):
            return Response(
                {"detail": "You do not have permission to update this product."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_supplier_or_admin(request.user):
            return Response(
                {"detail": "Only suppliers or admin can delete products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if getattr(product, "supplier_id", None) != request.user.id and not is_admin(request.user):
            return Response(
                {"detail": "You do not have permission to delete this product."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product.delete()
        return Response(
            {"message": "Product deleted successfully."},
            status=status.HTTP_200_OK,
        )


class SupplierProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_supplier_or_admin(request.user):
            return Response(
                {"detail": "Only suppliers or admin can view supplier products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if is_admin(request.user):
            products = Product.objects.select_related("supplier").all().order_by("-id")
        else:
            products = Product.objects.select_related("supplier").filter(
                supplier=request.user
            ).order_by("-id")

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_buyer_role(request.user):
            return Response(
                {"detail": "Only buyers or admin can view orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if is_admin(request.user):
            queryset = Order.objects.all().order_by("-id")
        else:
            queryset = Order.objects.filter(buyer=request.user).order_by("-id")

        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not is_buyer_role(request.user):
            return Response(
                {"detail": "Only buyers or admin can view order details."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            if is_admin(request.user):
                order = Order.objects.get(pk=pk)
            else:
                order = Order.objects.get(pk=pk, buyer=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_buyer_role(request.user):
            return Response(
                {"detail": "Only buyers or admin can create orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = OrderSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SupplierOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not is_supplier_or_admin(user):
            return Response(
                {"detail": "Only suppliers or admin can view supplier orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            if is_admin(user):
                orders = Order.objects.all().distinct().order_by("-id")
            else:
                orders = (
                    Order.objects.filter(items__product__supplier=user)
                    .distinct()
                    .order_by("-id")
                )
        except Exception as exc:
            return Response(
                {
                    "detail": "Failed to load supplier orders. Check Order -> items -> product -> supplier relationships.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RFQListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_user_role(request.user)

        if role in ["buyer_individual", "buyer_company", "buyer_establishment", "buyer"]:
            rfqs = RFQ.objects.filter(buyer=request.user).order_by("-id")
        elif role == "supplier":
            rfqs = RFQ.objects.filter(supplier=request.user).order_by("-id")
        elif role == "admin":
            rfqs = RFQ.objects.all().order_by("-id")
        else:
            return Response(
                {"detail": "You do not have permission to view RFQs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RFQSerializer(rfqs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not is_buyer_role(request.user):
            return Response(
                {"detail": "Only buyers or admin can create RFQs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RFQSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            rfq = serializer.save()
            return Response(RFQSerializer(rfq).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RFQDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        rfq = get_rfq_or_404(pk)
        if not rfq:
            return Response(
                {"detail": "RFQ not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        role = get_user_role(request.user)

        if role == "admin":
            pass
        elif role in ["buyer_individual", "buyer_company", "buyer_establishment", "buyer"]:
            if rfq.buyer_id != request.user.id:
                return Response(
                    {"detail": "You do not have permission to view this RFQ."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif role == "supplier":
            if rfq.supplier_id != request.user.id:
                return Response(
                    {"detail": "You do not have permission to view this RFQ."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            return Response(
                {"detail": "You do not have permission to view this RFQ."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RFQSerializer(rfq)
        return Response(serializer.data, status=status.HTTP_200_OK)


# =========================
# Admin Advanced Views
# =========================

class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_has_permission(request.user, "manage_users"):
            return Response(
                {"detail": "You do not have permission to manage users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        users = User.objects.select_related("profile").all().order_by("-id")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not admin_has_permission(request.user, "manage_users"):
            return Response(
                {"detail": "You do not have permission to manage users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_user_or_404(pk)
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if not admin_has_permission(request.user, "manage_users"):
            return Response(
                {"detail": "You do not have permission to manage users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_user_or_404(pk)
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response(UserSerializer(updated_user).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not admin_has_permission(request.user, "manage_users"):
            return Response(
                {"detail": "You do not have permission to manage users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            target_user_id = int(pk)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid user id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.id == target_user_id:
            return Response(
                {"detail": "You cannot delete your own admin account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_user_or_404(target_user_id)
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.delete()
        return Response(
            {"message": "User deleted successfully."},
            status=status.HTTP_200_OK,
        )


class AdminUserToggleStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not admin_has_permission(request.user, "manage_users"):
            return Response(
                {"detail": "You do not have permission to manage users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            target_user_id = int(pk)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid user id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.id == target_user_id:
            return Response(
                {"detail": "You cannot change your own status from this action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_user_or_404(target_user_id)
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = get_user_profile(user)
        if not profile:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        current_status = (profile.status or "").strip().lower()

        if current_status == "active":
            profile.status = "inactive"
        else:
            profile.status = "active"

        profile.save()

        return Response(
            {
                "message": "User status updated successfully.",
                "status": profile.status,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminSuppliersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_has_permission(request.user, "manage_suppliers"):
            return Response(
                {"detail": "You do not have permission to manage suppliers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        suppliers = (
            User.objects.select_related("profile")
            .filter(profile__role="supplier")
            .order_by("-id")
        )
        serializer = UserSerializer(suppliers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminSupplierApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not admin_has_permission(request.user, "approve_suppliers"):
            return Response(
                {"detail": "You do not have permission to approve suppliers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user = User.objects.select_related("profile").get(pk=pk, profile__role="supplier")
        except User.DoesNotExist:
            return Response(
                {"detail": "Supplier not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = get_user_profile(user)
        if not profile:
            return Response(
                {"detail": "Supplier profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile.status = "approved"
        profile.save()

        return Response(
            {
                "message": "Supplier approved successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminSupplierRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not admin_has_permission(request.user, "approve_suppliers"):
            return Response(
                {"detail": "You do not have permission to reject suppliers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user = User.objects.select_related("profile").get(pk=pk, profile__role="supplier")
        except User.DoesNotExist:
            return Response(
                {"detail": "Supplier not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = get_user_profile(user)
        if not profile:
            return Response(
                {"detail": "Supplier profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile.status = "rejected"
        profile.save()

        return Response(
            {
                "message": "Supplier rejected successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_has_permission(request.user, "manage_products"):
            return Response(
                {"detail": "You do not have permission to manage products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        products = Product.objects.select_related("supplier").all().order_by("-id")
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not admin_has_permission(request.user, "manage_products"):
            return Response(
                {"detail": "You do not have permission to manage products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if not admin_has_permission(request.user, "manage_products"):
            return Response(
                {"detail": "You do not have permission to manage products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminProductUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            updated_product = serializer.save()
            return Response(ProductSerializer(updated_product).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not admin_has_permission(request.user, "manage_products"):
            return Response(
                {"detail": "You do not have permission to manage products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        product.delete()
        return Response(
            {"message": "Product deleted successfully."},
            status=status.HTTP_200_OK,
        )


class AdminProductApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not admin_has_permission(request.user, "approve_products"):
            return Response(
                {"detail": "You do not have permission to approve products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        product.status = "approved"
        product.is_active = True
        product.save()

        return Response(
            {
                "message": "Product approved successfully.",
                "product": ProductSerializer(product).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminProductRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not admin_has_permission(request.user, "approve_products"):
            return Response(
                {"detail": "You do not have permission to reject products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product = get_product_or_404(pk)
        if not product:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        product.status = "rejected"
        product.is_active = False
        product.save()

        return Response(
            {
                "message": "Product rejected successfully.",
                "product": ProductSerializer(product).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_has_permission(request.user, "manage_orders"):
            return Response(
                {"detail": "You do not have permission to manage orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = Order.objects.all().order_by("-id")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not admin_has_permission(request.user, "manage_orders"):
            return Response(
                {"detail": "You do not have permission to manage orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order = get_order_or_404(pk)
        if not order:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if not admin_has_permission(request.user, "manage_orders"):
            return Response(
                {"detail": "You do not have permission to manage orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order = get_order_or_404(pk)
        if not order:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminOrderUpdateSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            updated_order = serializer.save()
            return Response(OrderSerializer(updated_order).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminRFQsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_has_permission(request.user, "manage_rfqs"):
            return Response(
                {"detail": "You do not have permission to manage RFQs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        rfqs = RFQ.objects.all().order_by("-id")
        serializer = RFQSerializer(rfqs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminRFQDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not admin_has_permission(request.user, "manage_rfqs"):
            return Response(
                {"detail": "You do not have permission to manage RFQs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        rfq = get_rfq_or_404(pk)
        if not rfq:
            return Response(
                {"detail": "RFQ not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RFQSerializer(rfq)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if not admin_has_permission(request.user, "manage_rfqs"):
            return Response(
                {"detail": "You do not have permission to manage RFQs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        rfq = get_rfq_or_404(pk)
        if not rfq:
            return Response(
                {"detail": "RFQ not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminRFQUpdateSerializer(rfq, data=request.data, partial=True)
        if serializer.is_valid():
            updated_rfq = serializer.save()
            return Response(RFQSerializer(updated_rfq).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_has_permission(request.user, "view_analytics"):
            return Response(
                {"detail": "You do not have permission to view analytics."},
                status=status.HTTP_403_FORBIDDEN,
            )

        total_users = User.objects.count()
        total_suppliers = UserProfile.objects.filter(role="supplier").count()
        total_admins = UserProfile.objects.filter(role="admin").count()
        total_buyers = UserProfile.objects.filter(
            role__in=["buyer", "buyer_individual", "buyer_company", "buyer_establishment"]
        ).count()

        total_products = Product.objects.count()
        approved_products = Product.objects.filter(status="approved").count()
        pending_products = Product.objects.filter(status="pending").count()
        rejected_products = Product.objects.filter(status="rejected").count()

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status="pending").count()
        confirmed_orders = Order.objects.filter(status="confirmed").count()
        shipped_orders = Order.objects.filter(status="shipped").count()
        completed_orders = Order.objects.filter(status="completed").count()
        cancelled_orders = Order.objects.filter(status="cancelled").count()

        total_rfqs = RFQ.objects.count()
        pending_rfqs = RFQ.objects.filter(status="pending").count()
        quoted_rfqs = RFQ.objects.filter(status="quoted").count()
        accepted_rfqs = RFQ.objects.filter(status="accepted").count()
        rejected_rfqs = RFQ.objects.filter(status="rejected").count()

        sales_aggregate = Order.objects.exclude(status="cancelled").aggregate(
            total_sales=Sum("total_price")
        )
        total_sales = sales_aggregate.get("total_sales") or 0

        orders_by_status_qs = (
            Order.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        orders_by_status = [
            {
                "status": item["status"] or "unknown",
                "count": item["count"],
            }
            for item in orders_by_status_qs
        ]

        rfqs_by_status_qs = (
            RFQ.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        rfqs_by_status = [
            {
                "status": item["status"] or "unknown",
                "count": item["count"],
            }
            for item in rfqs_by_status_qs
        ]

        products_by_category_qs = (
            Product.objects.values("category")
            .annotate(count=Count("id"))
            .order_by("-count", "category")
        )
        products_by_category = [
            {
                "category": item["category"] or "Uncategorized",
                "count": item["count"],
            }
            for item in products_by_category_qs
        ]

        latest_orders = []
        recent_orders = Order.objects.select_related("buyer").order_by("-created_at")[:5]
        for order in recent_orders:
            latest_orders.append(
                {
                    "id": order.id,
                    "buyer": getattr(order.buyer, "username", "")
                    or getattr(order.buyer, "email", "Unknown Buyer"),
                    "total": str(order.total_price),
                    "status": order.status,
                    "date": order.created_at.strftime("%Y-%m-%d %H:%M")
                    if getattr(order, "created_at", None)
                    else "",
                }
            )

        latest_rfqs = []
        recent_rfqs = RFQ.objects.select_related("buyer", "supplier").order_by("-created_at")[:5]
        for rfq in recent_rfqs:
            latest_rfqs.append(
                {
                    "id": rfq.id,
                    "product_name": rfq.product_name,
                    "buyer": getattr(rfq.buyer, "username", "")
                    or getattr(rfq.buyer, "email", "Unknown Buyer"),
                    "supplier": (
                        getattr(rfq.supplier, "username", "")
                        or getattr(rfq.supplier, "email", "Unassigned")
                    )
                    if rfq.supplier
                    else "Unassigned",
                    "quantity": rfq.quantity,
                    "status": rfq.status,
                    "date": rfq.created_at.strftime("%Y-%m-%d %H:%M")
                    if getattr(rfq, "created_at", None)
                    else "",
                }
            )

        return Response(
            {
                "summary": {
                    "total_users": total_users,
                    "total_buyers": total_buyers,
                    "total_suppliers": total_suppliers,
                    "total_admins": total_admins,
                    "total_products": total_products,
                    "approved_products": approved_products,
                    "pending_products": pending_products,
                    "rejected_products": rejected_products,
                    "total_orders": total_orders,
                    "pending_orders": pending_orders,
                    "confirmed_orders": confirmed_orders,
                    "shipped_orders": shipped_orders,
                    "completed_orders": completed_orders,
                    "cancelled_orders": cancelled_orders,
                    "total_rfqs": total_rfqs,
                    "pending_rfqs": pending_rfqs,
                    "quoted_rfqs": quoted_rfqs,
                    "accepted_rfqs": accepted_rfqs,
                    "rejected_rfqs": rejected_rfqs,
                    "total_sales": str(total_sales),
                },
                "orders_by_status": orders_by_status,
                "rfqs_by_status": rfqs_by_status,
                "products_by_category": products_by_category,
                "latest_orders": latest_orders,
                "latest_rfqs": latest_rfqs,
            },
            status=status.HTTP_200_OK,
        )