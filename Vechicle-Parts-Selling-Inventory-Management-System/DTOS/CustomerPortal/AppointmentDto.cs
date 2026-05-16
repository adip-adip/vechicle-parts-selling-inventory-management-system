namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

public class CreateAppointmentDto
{
    public int? VehicleId { get; set; }
    public string ServiceType { get; set; } = null!;
    public DateTime AppointmentDate { get; set; }
    public string? Notes { get; set; }
}

public class AppointmentResponseDto
{
    public int Id { get; set; }
    public string ServiceType { get; set; } = null!;
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }
    public string? VehicleRegistration { get; set; }
    public DateTime CreatedAt { get; set; }
}