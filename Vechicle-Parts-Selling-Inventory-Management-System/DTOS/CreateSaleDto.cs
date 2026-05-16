using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class CreateSaleItemDto
{
    [Required]
    public int VehiclePartId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}

public class CreateSaleDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateSaleItemDto> Items { get; set; } = new();
}
