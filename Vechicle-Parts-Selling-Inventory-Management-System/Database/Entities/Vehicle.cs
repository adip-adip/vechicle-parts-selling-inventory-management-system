using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

public class Vehicle
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    [StringLength(20)]
    public string RegistrationNumber { get; set; } = null!;

    [StringLength(50)]
    public string Make { get; set; } = null!;

    [StringLength(50)]
    public string Model { get; set; } = null!;

    public int Year { get; set; }

    [StringLength(50)]
    public string? VIN { get; set; }
}
