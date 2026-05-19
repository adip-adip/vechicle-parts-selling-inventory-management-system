using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class StaffPartRequestResponseDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string CustomerEmail { get; set; } = null!;
    public string PartName { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public DateTime RequestedAt { get; set; }
}

public class UpdatePartRequestStatusDto
{
    [Required]
    [RegularExpression("^(Approved|Fulfilled|Rejected)$")]
    public string Status { get; set; } = null!;
}

public class UpdateAppointmentStatusDto
{
    [Required]
    [RegularExpression("^(Confirmed|Completed)$")]
    public string Status { get; set; } = null!;
}