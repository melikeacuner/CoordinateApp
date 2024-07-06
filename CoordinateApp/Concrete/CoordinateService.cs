using CoordinateApp;
using CoordinateApp.Abstract;
using CoordinateApp.Models;
using Npgsql;

namespace CoordinateApp.Concrete
{
    public class CoordinateService : ICoordinateService
    {
        private readonly string _connectionString = "Server=localhost;Port=5432;Database=CoordinateDb;UserId=postgres;Password=admin;";

        public CoordinateService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public Response Add(Coordinate k)
        {
            var result = new Response();
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand())
                    {
                        command.Connection = connection;
                        command.CommandText = @"INSERT INTO Coordinates (""Id"", ""X"", ""Y"", ""Name"") VALUES (@Id, @X, @Y, @Name)";
                        command.Parameters.AddWithValue("Id", k.Id);
                        command.Parameters.AddWithValue("X", k.X);
                        command.Parameters.AddWithValue("Y", k.Y);
                        command.Parameters.AddWithValue("Name", k.Name);
                    }
                }
                result.IsSucces = true;
                result.Data = k;
                result.Message = "Added new coordinate";
            }
            catch (Exception ex)
            {
                result.IsSucces = false;
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }
        public Response Delete(int id)
        {
            var result = new Response();
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand())
                    {
                        command.Connection = connection;
                        command.CommandText = @"DELETE FROM Coordinates WHERE ""Id"" = @Id";
                        command.Parameters.AddWithValue("Id", id);
                    }
                }
                result.IsSucces = true;
                result.Message = "Deleted coordinate";
            }
            catch (Exception ex)
            {
                result.IsSucces = false;
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }
        public Response GetById(int id)
        {
            var result = new Response();
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand())
                    {
                        command.Connection = connection;
                        command.CommandText = @"SELECT ""Id"", ""X"", ""Y"", ""Name"" FROM Coordinates WHERE ""Id"" = @Id";
                        command.Parameters.AddWithValue("Id", id);

                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                var coordinate = new Coordinate
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    X = Convert.ToInt32(reader["X"]),
                                    Y = Convert.ToInt32(reader["Y"]),
                                    Name = reader["Name"].ToString()
                                };

                                result.Data = coordinate;
                                result.Message = "OK";
                            }
                            else
                            {
                                result.Message = "Coordinate not found";
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }
        public Response GetAll()
        {
            var result = new Response();
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand())
                    {
                        command.Connection = connection;
                        command.CommandText = @"SELECT * FROM Coordinates";

                        var coordinates = new List<Coordinate>();

                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var coordinate = new Coordinate
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    X = Convert.ToInt32(reader["X"]),
                                    Y = Convert.ToInt32(reader["Y"]),
                                    Name = Convert.ToString(reader["Name"]),
                                };

                                coordinates.Add(coordinate);
                            }
                        }

                        result.IsSucces = true;
                        result.Data = coordinates;
                        result.Message = "OK";
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }
        public Response Update(Coordinate korFromReq)
        {
            var result = new Response();
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new NpgsqlCommand())
                    {
                        command.Connection = connection;
                        command.CommandText = @"UPDATE Coordinates SET ""X"" = @X, ""Y"" = @Y, ""Name"" = @Name WHERE ""Id"" = @Id";
                        command.Parameters.AddWithValue("Id", korFromReq.Id);
                        command.Parameters.AddWithValue("X", korFromReq.X);
                        command.Parameters.AddWithValue("Y", korFromReq.Y);
                        command.Parameters.AddWithValue("Name", korFromReq.Name);
                    }
                }
                result.Message = "Updated coordinate";
            }
            catch (Exception ex)
            {
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }

    }
}
