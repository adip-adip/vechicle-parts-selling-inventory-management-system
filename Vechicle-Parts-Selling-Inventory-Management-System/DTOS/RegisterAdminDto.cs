using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class RegisterAdminDto
{
    [Required] public string FirstName { get; set; } = null!;

    [Required] public string LastName { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required] public string Password { get; set; } = null!;
}
