using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class CreatePurchaseInvoiceItemDto
{
    [Required]
    public int VehiclePartId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal UnitCost { get; set; }
}

public class CreatePurchaseInvoiceDto
{
    [Required]
    public int VendorId { get; set; }

    public DateTime? InvoiceDate { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Unpaid";

    [Required]
    [MinLength(1)]
    public List<CreatePurchaseInvoiceItemDto> Items { get; set; } = new();
}
