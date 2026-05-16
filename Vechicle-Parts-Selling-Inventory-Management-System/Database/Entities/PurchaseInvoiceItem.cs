using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

public class PurchaseInvoiceItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PurchaseInvoiceId { get; set; }

    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;

    [Required]
    public int VehiclePartId { get; set; }

    public VehiclePart VehiclePart { get; set; } = null!;

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    public decimal UnitCost { get; set; }

    public decimal Subtotal { get; set; }
}
