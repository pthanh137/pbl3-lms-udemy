from django.urls import path
from lms.views.payment_views import (
    CreateOrderView,
    FakeConfirmPaymentView,
    PaymentStatusView
)

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('fake-confirm/', FakeConfirmPaymentView.as_view(), name='fake-confirm'),
    path('status/<int:pk>/', PaymentStatusView.as_view(), name='payment-status'),
]


