namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

public class CreateVehicleDto
{
    public string RegistrationNumber { get; set; } = null!;
    public string Make { get; set; } = null!;
    public string Model { get; set; } = null!;
    public int Year { get; set; }
    public string? VIN { get; set; }
}
