from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib.auth import get_user_model

from rest_framework.response import Response
from rest_framework import status

import logging

logger = logging.getLogger(__name__)
User = get_user_model()

# TODO CRIAR DECORATORS E NOVA TEMPLATE DE LOGIN

