
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, title = "SignalRTest" }) => {


  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <div className="flex-grow bg-white">
        <main role="main" className="h-full">
          {children}
        </main>
      </div>
      <Footer/>
    </div>
  );
};


export default Layout;