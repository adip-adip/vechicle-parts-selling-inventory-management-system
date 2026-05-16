namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

public class CreatePartRequestDto
{
    public string PartName { get; set; } = null!;
    public string? Description { get; set; }
}

public class PartRequestResponseDto
{
    public int Id { get; set; }
    public string PartName { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public DateTime RequestedAt { get; set; }
}