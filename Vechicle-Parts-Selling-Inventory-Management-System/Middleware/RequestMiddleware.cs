using System.Security.Claims;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Middleware;

public class RequestMiddleware(ILogger<RequestMiddleware> logger) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var requestDate = DateTime.UtcNow;
        var method = context.Request.Method;
        var path = context.Request.Path;
        var userRole = "Anonymous";

        if (context.User.Identity?.IsAuthenticated == true)
        {
            var roleClaim = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            userRole = roleClaim?.Value ?? "Unknown";
        }

        await next(context);

        var statusCode = context.Response.StatusCode;
        var timeTaken = (DateTime.UtcNow - requestDate).TotalMilliseconds;

        logger.LogInformation(
            "[{Date}] {Method} {Path} | User:{Role} | Status:{Status} | Time:{Time:F2}ms",
            requestDate.ToString("yyyy-MM-dd HH:mm:ss"), method, path, userRole, statusCode, timeTaken);
    }
}
