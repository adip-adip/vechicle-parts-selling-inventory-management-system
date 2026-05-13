using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

[Table("Users")]
public class Users : IdentityUser
{
    [Required] public string FirstName { get; set; } = null!;

    [Required] public string LastName { get; set; } = null!;

    public byte[]? ProfilePicture { get; set; }

    [StringLength(100)]
    public string? ProfilePictureContentType { get; set; }
}
