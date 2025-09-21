
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, title = "SignalRTest" }) => {


  return (
    <div className="min-h-screen flex flex-col">

        <Header/>

      <div className="min-w-100 justify-center px-4 flex-grow">
        <main role="main" className="pb-3">
          {children}
        </main>
      </div>

        <Footer/>
    </div>
  );
};


export default Layout;