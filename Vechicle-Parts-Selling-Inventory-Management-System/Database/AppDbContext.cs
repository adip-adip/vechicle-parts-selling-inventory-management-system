using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database;

public class AppDbContext : IdentityDbContext<Users>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Users>().ToTable("Users");
        builder.Entity<IdentityRole>().ToTable("Roles");

        SeedRoles(builder);
    }

    private static void SeedRoles(ModelBuilder builder)
    {
        var roles = new List<IdentityRole>
        {
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Admin",
                NormalizedName = "ADMIN",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            },
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Staff",
                NormalizedName = "STAFF",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            },
            new()
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Customer",
                NormalizedName = "CUSTOMER",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            }
        };
        builder.Entity<IdentityRole>().HasData(roles);
    }
}
