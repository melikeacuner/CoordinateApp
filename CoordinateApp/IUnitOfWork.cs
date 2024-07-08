using CoordinateApp.Repositories.Abstract;

namespace CoordinateApp
{
    public interface IUnitOfWork : IDisposable
    {
        ICoordinateRepository CoordinateRepository { get; }
        public int Commit();
    }
}
