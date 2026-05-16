namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

public class UpdateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

public class UpdateVehicleDto
{
    public string? Make { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public string? VIN { get; set; }
}