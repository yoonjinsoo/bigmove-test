from django.http import JsonResponse

class APIErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'status': 'error'
            }, status=500) 