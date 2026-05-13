using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class RegisterCustomerDto
{
    [Required] public string FirstName { get; set; } = null!;

    [Required] public string LastName { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required] public string Password { get; set; } = null!;

    [Required] public string Phone { get; set; } = null!;

    public string? Address { get; set; }
}
