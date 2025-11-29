from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.utils.translation import gettext_lazy as _


class CustomJWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication that works without Django User model.
    Decodes token and sets request.auth to the token payload (dict).
    """
    
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            # Validate and decode token
            validated_token = UntypedToken(raw_token)
        except TokenError as e:
            raise InvalidToken(_("Token is invalid or expired"))

        # Get payload from validated token
        # UntypedToken already decodes the token, we just need to get the payload
        token_payload = validated_token.payload

        # Return (None, payload) - this sets request.user = None and request.auth = payload
        return (None, token_payload)
    
    def get_header(self, request):
        """
        Extracts the header containing the JSON web token from the given
        request.
        """
        header = request.META.get("HTTP_AUTHORIZATION")

        if isinstance(header, str):
            # Work around django test client oddness
            header = header.encode("utf-8")

        return header

    def get_raw_token(self, header):
        """
        Extracts an unvalidated JSON web token from the given "Authorization"
        header value.
        """
        parts = header.split()

        if len(parts) == 0:
            # Empty AUTHORIZATION header sent
            return None

        if parts[0].decode("utf-8") != "Bearer":
            # Assume the header does not contain a JSON web token
            return None

        if len(parts) != 2:
            raise AuthenticationFailed(
                _("Authorization header must contain two space-delimited values"),
                code="bad_authorization_header",
            )

        return parts[1]
