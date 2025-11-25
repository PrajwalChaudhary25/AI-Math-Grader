import React, { Component } from 'react';

class Navbar extends Component {
    state = {  } 
    render() { 
        return (
            <div className = "h-14 w-full bg-[#16610E] text-white text-[21px] sm:text-[28px] flex items-center justify-start pl-5 font-jua">
                AI Math Grader
            </div>
        );
    }
}
 
export default Navbar;