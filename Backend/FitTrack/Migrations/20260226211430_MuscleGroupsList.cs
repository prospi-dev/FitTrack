using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitTrack.Migrations
{
    /// <inheritdoc />
    public partial class MuscleGroupsList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MuscleGroup",
                table: "Exercises");

            migrationBuilder.AddColumn<string>(
                name: "MuscleGroups",
                table: "Exercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MuscleGroups",
                table: "Exercises");

            migrationBuilder.AddColumn<string>(
                name: "MuscleGroup",
                table: "Exercises",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
