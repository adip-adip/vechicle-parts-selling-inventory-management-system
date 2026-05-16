using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Vechicle_Parts_Selling_Inventory_Management_System.Migrations
{
    /// <inheritdoc />
    public partial class AddVehiclePartAndSaleEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "280fe30d-244d-4776-90f2-a6390e471142");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "d860d7b0-5574-4b96-831f-295bc5aea586");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "ed4370bd-923c-4e8a-a540-036165ae21e6");

            migrationBuilder.CreateTable(
                name: "Sales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    SaleDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomerId = table.Column<string>(type: "text", nullable: true),
                    PaymentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VehicleParts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    StockQuantity = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleParts", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "54d14d33-8711-473b-b0b5-154262163af8", "5abc6d83-8bd9-478e-afed-8d1e795a1695", "Admin", "ADMIN" },
                    { "6fc02d04-a5ac-4d57-b7d6-af4ee2748887", "beaf7e40-9708-4802-9908-be1b524da7f1", "Staff", "STAFF" },
                    { "7334bb87-c06a-4c4f-8358-40d13fa293de", "86a82914-13cb-464c-9372-cb8b10ebf77d", "Customer", "CUSTOMER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sales");

            migrationBuilder.DropTable(
                name: "VehicleParts");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "54d14d33-8711-473b-b0b5-154262163af8");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "6fc02d04-a5ac-4d57-b7d6-af4ee2748887");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "7334bb87-c06a-4c4f-8358-40d13fa293de");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "280fe30d-244d-4776-90f2-a6390e471142", "64185bae-265e-409b-bb3e-ccd1de9ab497", "Customer", "CUSTOMER" },
                    { "d860d7b0-5574-4b96-831f-295bc5aea586", "9d6f4f5f-e413-49e1-b5c2-2fe1d5d3f540", "Admin", "ADMIN" },
                    { "ed4370bd-923c-4e8a-a540-036165ae21e6", "cce11122-1c7d-41b2-bac7-f325ec36bb31", "Staff", "STAFF" }
                });
        }
    }
}
