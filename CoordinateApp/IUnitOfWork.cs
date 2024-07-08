using CoordinateApp.Repositories.Abstract;

namespace CoordinateApp
{
    public interface IUnitOfWork
    {
        ICoordinateRepository CoordinateRepository { get; }
        void Commit();
    }
}
