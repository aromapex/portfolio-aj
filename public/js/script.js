document.addEventListener('DOMContentLoaded', function() {
    const typed = new Typed('.multiple-texts', {
        strings: ['console.log', 'System.out.printIn', 'Console.WriteLine', 'std::cout<<'],
        typeSpeed: 35,
        backSpeed: 35,
        backDelay: 800,
        loop: true
    });
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-bar ul');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

});

