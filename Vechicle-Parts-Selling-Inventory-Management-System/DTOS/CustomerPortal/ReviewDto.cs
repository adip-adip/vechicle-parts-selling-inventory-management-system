namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

public class CreateReviewDto
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public int? AppointmentId { get; set; }
}

public class ReviewResponseDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? AppointmentId { get; set; }
    public string? ServiceType { get; set; }
}
