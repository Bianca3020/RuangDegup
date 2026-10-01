<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MemberMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'member') {
            return response()->json([
                'message' => 'Akses hanya untuk member',
            ], 403);
        }

        return $next($request);
    }
}