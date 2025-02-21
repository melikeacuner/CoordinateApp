﻿using AutoMapper;
using CoordinateApp.Entity;
using CoordinateApp.Entity.Dto;
using CoordinateApp.Services.Abstract;


namespace CoordinateApp.Services.Concrete
{
    public class CoordinateService : ICoordinateService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CoordinateService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public Response Add(CoordinatesAddDto coordinatesAddDto)
        {
            var coordinate = _mapper.Map<Coordinates>(coordinatesAddDto);
            var result = new Response();
            try
            {
                using (_unitOfWork)
                {
                    if (!_unitOfWork.CoordinateRepository.Add(coordinate))
                    {
                        result.Message = "Null object sent!";
                        return result;
                    }

                    var saveResult = _unitOfWork.Commit();
                    if (!(saveResult > 0))
                    {
                        result.Message = "There is no change on db";
                        result.IsSucces = false;
                        return result;
                    }

                    result.IsSucces = true;
                    result.Data = coordinatesAddDto;
                    result.Message = "Added new coordinate";
                }
            }
            catch (Exception ex)
            {
                result.IsSucces = false;
                result.Message = $"Exception occurred: {ex.Message}";
                if (ex.InnerException != null)
                {
                    result.Message += $" Inner exception: {ex.InnerException.Message}";
                }
                // Consider logging the full exception details here
            }
            return result;
        }
        public Response Delete(Guid id)
        {
            var result = new Response();
            try
            {
                using (_unitOfWork)
                {
                    if (!_unitOfWork.CoordinateRepository.Delete(id))
                    {
                        result.Message = "Null object sent!";
                        return result;
                    }

                    if (!(_unitOfWork.Commit() > 0))
                    {
                        result.Message = "There is no change on db";
                        result.IsSucces = false;
                        return result;
                    }

                    result.IsSucces = true;
                    result.Message = "Coordinate Deleted";
                }
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
                using (_unitOfWork)
                {
                    var coordinateFromDb = _unitOfWork.CoordinateRepository.GetById(id);
                    if (coordinateFromDb == null)
                    {
                        result.Message = "Not Found!";
                        return result;
                    }

                    // AutoMapper kullanarak dönüşüm
                    var coordinateDto = _mapper.Map<CoordinatesDto>(coordinateFromDb);
                    result.IsSucces = true;
                    result.Message = "OK";
                    result.Data = coordinateDto;
                }
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
                using (_unitOfWork)
                {
                    var coordinates = _unitOfWork.CoordinateRepository.GetAll();
                    var coordinatesDto = _mapper.Map<IEnumerable<CoordinatesDto>>(coordinates);
                    result.Data = coordinatesDto;
                    result.IsSucces = true;
                    result.Message = "OK";
                }
            }
            catch (Exception ex)
            {
                result.Message = "Exception occurred: " + ex.Message;
                result.IsSucces = false;
            }
            return result;
        }

        public Response Update(CoordinatesDto korFromReq)
        {
            var result = new Response();
            try
            {
                using (_unitOfWork)
                {
                    var coordinate = _mapper.Map<Coordinates>(korFromReq);
                    if (!_unitOfWork.CoordinateRepository.Update(coordinate))
                    {
                        result.IsSucces = false;
                        result.Message = "Record not found!";
                        return result;
                    }

                    if (!(_unitOfWork.Commit() > 0))
                    {
                        result.Message = "There is no change on db";
                        result.IsSucces = false;
                        return result;
                    }

                    result.IsSucces = true;
                    result.Data = korFromReq;
                    result.Message = "Coordinate Updated";
                }
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
