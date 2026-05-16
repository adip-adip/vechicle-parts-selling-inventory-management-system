using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

public class PartRequest
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    [StringLength(100)]
    public string PartName { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}