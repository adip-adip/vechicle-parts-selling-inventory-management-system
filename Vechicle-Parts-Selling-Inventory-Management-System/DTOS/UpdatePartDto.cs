using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class UpdatePartDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }
}
