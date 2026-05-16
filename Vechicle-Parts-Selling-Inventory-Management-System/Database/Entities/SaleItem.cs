using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

public class SaleItem
{
    [Key]
    public int Id { get; set; }

    public int SaleId { get; set; }

    public Sale Sale { get; set; } = null!;

    public int VehiclePartId { get; set; }

    public VehiclePart VehiclePart { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }
}
