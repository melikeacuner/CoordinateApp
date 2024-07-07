using CoordinateApp.Entity.Dto;
using CoordinateApp.Models;
using CoordinateApp.Repositories.Abstract;
using CoordinateApp.Services.Abstract;

namespace CoordinateApp.Services.Concrete
{
    public class CoordinateService : ICoordinateService
    {
        private readonly ICoordinateRepository _coordinateRepository;

        public CoordinateService(ICoordinateRepository coordinateRepository)
        {
            _coordinateRepository = coordinateRepository;
        }

        public Response Add(Coordinate k)
        {
            var result = new Response();
            try
            {
                if (!_coordinateRepository.Add(k))
                {
                    result.Message = "There is no change on db";
                    return result;
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

        public Response Delete(Guid id)
        {
            var result = new Response();
            try
            {
                if (!_coordinateRepository.Delete(id))
                {
                    result.Message = "There is no change on db";
                    return result;
                }

                result.IsSucces = true;
                result.Message = "Coordinate Deleted";
            }
            catch (Exception ex)
            {
                result.IsSucces = false;
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }


        public Response GetById(Guid id)
        {
            var result = new Response();
            try
            {
                var coordinateFromDb = _coordinateRepository.GetById(id);
                if (coordinateFromDb == null)
                {
                    result.Message = "Not Found !";
                    return result;
                }
                result.IsSucces = true;
                result.Message = "OK";
                result.Data = coordinateFromDb;
            }
            catch (Exception ex)
            {
                result.Message = "Exception occurred: " + ex.Message;
                result.IsSucces = false;
            }

            return result;
        }
        public Response GetAll()
        {
            var result = new Response();
            try
            {
                var coordinates = _coordinateRepository.GetAll();
                result.Data = coordinates;
                result.IsSucces = true;
                result.Message = "OK";
            }
            catch (Exception ex)
            {
                result.Message = "Exception occurred: " + ex.Message;
                result.IsSucces = false;
            }
            return result;
        }
        public Response Update(Coordinate korFromReq)
        {
            var result = new Response();
            try
            {
                if (!_coordinateRepository.Update(korFromReq))
                {
                    result.IsSucces = false;
                    result.Message = "Zero rows affected !";
                    return result;
                }
                result.IsSucces = true;
                result.Data = korFromReq;
                result.Message = "Coordinate Updated";
            }
            catch (Exception ex)
            {
                result.IsSucces = false;
                result.Message = "Exception occurred: " + ex.Message;
            }
            return result;
        }

    }
}
