using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Swagger;

public class FileUploadOperationFilter : IParameterFilter
{
    public void Apply(OpenApiParameter parameter, ParameterFilterContext context)
    {
        if (context.ApiParameterDescription.Type == typeof(IFormFile))
        {
            parameter.Schema = new OpenApiSchema
            {
                Type = "string",
                Format = "binary"
            };
        }
    }
}
