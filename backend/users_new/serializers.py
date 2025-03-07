from rest_framework import serializers


class LoginAsUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
