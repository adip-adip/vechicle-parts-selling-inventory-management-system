using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class CreateCustomerWithVehicleDto
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = null!;

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = null!;

    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = null!;

    [StringLength(200)]
    public string? Address { get; set; }

    [Required]
    [StringLength(20)]
    public string RegistrationNumber { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Make { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Model { get; set; } = null!;

    [Required]
    [Range(1886, 2100)]
    public int Year { get; set; }

    [StringLength(50)]
    public string? VIN { get; set; }
}
