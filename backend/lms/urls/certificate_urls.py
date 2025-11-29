from django.urls import path
from lms.views.certificate_views import (
    StudentCertificateListView,
    StudentCertificateDetailView
)

urlpatterns = [
    path('', StudentCertificateListView.as_view(), name='student-certificates-list'),
    path('<int:pk>/', StudentCertificateDetailView.as_view(), name='student-certificate-detail'),
]

