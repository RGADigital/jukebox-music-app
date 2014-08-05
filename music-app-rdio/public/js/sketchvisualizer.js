
       
            var musicData,
                intervalId;

            function sortNumber(a,b)
            {
                return a - b
            };

            var socket = io.connect('http://'+window.location.hostname.toString()+':9001');
            socket.on('pot', function(data) {
                musicData = data.split(',');
                //musicData = musicData.sort(sortNumber).reverse();
                MAX_PARTICLES=musicData[1]*100;
                //console.log('MAX_PARTICLES from io-----'+ MAX_PARTICLES)
               DATA_FORCE=musicData[5]*25;
                //console.log('DATA_FORCE from io ------- ' + DATA_FORCE)
                console.log(musicData);
            });


            
            
        // ----------------------------------------
        // Particle
        // ----------------------------------------

        function Particle( x, y, radius ) {
            this.init( x, y, radius );
        }


        Particle.prototype = {

            init: function( x, y, radius ) {

                this.alive = true;

                this.radius = radius || 10;
                this.wander = .015;
                this.theta = random( TWO_PI );
                this.drag = 0.015;
                this.color = '#fff';

                this.x = x || 0.0;
                this.y = y || 0.0;

                this.vx = 0.0;
                this.vy = 0.0;
            },

            move: function() {

                this.x += this.vx;
                this.y += this.vy;

                this.vx *= this.drag;
                this.vy *= this.drag;

                this.theta += random( -0.5, 0.5 ) * this.wander;
                this.vx += sin( this.theta ) * 0.1;
                this.vy += cos( this.theta ) * 0.1;

                this.radius *= 0.97;
                this.alive = this.radius > .01;
            },

            draw: function( ctx ) {

                ctx.beginPath();
                ctx.arc( this.x, this.y, this.radius, 0, TWO_PI );
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        };

        // ----------------------------------------
        // Example
        // ----------------------------------------

        var MAX_PARTICLES = 10;
        console.log(MAX_PARTICLES);

        var COLOURS = 
//ten colors bold- darker on ends of array
        // [  '#CF0025', '#FF5108','#FF1258', '#FF7D2B' ,'#FFF22E','#00E53E', '#4DD0E1', '#BF51E8', '#411C4F', '#002691' ];

        [ '#FFF22E', '#FF7D2B' , '#FF1258', '#FF5108', '#CF0025', '#002691', '#411C4F' , '#BF51E8', '#4DD0E1', '#00E53E'
        ];

//OR ten colors kuler monochromatic
        // [ '#4DD0E1', '#2C767F', '#57ECFF', '#163B40' , '#4FD4E5', '#57ECFF', '#2B767F', '#4ED4E5', '#163B40' , '#4FD4E5'

        // ];

//OR ten colors google design monochromatic

    // [ '#00bcd4', '#e0f7fa' , '#b2ebf2' , '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1' , '#0097a7', '#00838f', '#006064'

    // ];




        var particles = [];
        var pool = [];

        var demo = Sketch.create({
            container: document.getElementById( 'container' )
        });

        demo.setup = function() {

            // Set off some initial particles at refresh or opening of page. 
            var i, x, y;

            for ( i = 0; i < COLOURS.length; i++ ) {
                x = ( demo.width * 0.5 ) + random( -100, 100 );
                y = ( demo.height * 0.5 ) + random( -100, 100 );
                demo.spawn( x, y, random( 0, 1.0 ), COLOURS[i] );
            }
        };

        //particles is an array where the balls are stored. If the length of the particles are greater or equal to the maximum set of particles, then it  deletes particles from the array using 'push' and 'shift'
        //pop is to remove the last element of the array 
        //pool is also another array and the particle array is set equal to that which replaces the lost element by a new particle (see pop : new Particle)


        var DATA_FORCE=10;

        demo.spawn = function( x, y, frequency, colour ) {

            // if ( particles.length >= MAX_PARTICLES )
            //     pool.push( particles.shift() );

            particle = pool.length ? pool.pop() : new Particle();
            particle.init( x, y, frequency * 100 );
                //frequency time 100 equals radius
            particle.wander = random( 0.5, 2.0 );
            particle.color = colour;
            particle.drag = random( 0.9, 0.99 );

            theta = random( TWO_PI );
            force = DATA_FORCE;

            particle.vx = sin( theta ) * force;
            particle.vy = cos( theta ) * force;

            particles.push( particle );
        };

        //update has to do with new data being created in the particle array and it basically says run this for loop until there are no more balls left in the array- if the particle is considered "alive" (defined through having a radius earlier), then move it. If it is considered dead, push it out of the array using splice (I think)

        demo.update = function() {

            var i, particle;

            for ( i = particles.length - 1; i >= 0; i-- ) {

                particle = particles[i];

                if ( particle.alive ) particle.move();
                else pool.push( particles.splice( i, 1 )[0] );
            }
        };

        // demo.draw global composite operation tells the browser how the new objects are going to be displayed in relation to the other. XOD shows the negative space in between

        // for loop tells it to draw how many balls exist in the array 

        demo.draw = function() {

            demo.globalCompositeOperation  = 'XOD';

            for ( var i = particles.length - 1; i >= 0; i-- ) {
                particles[i].draw( demo );
            }
        };

       


        demo.mousedown = function() {

            var particle, theta, force, touch, max, i, j, n;


            if (intervalId) {
                return;
            }

           intervalId = setInterval(function(){
            
        


            for (var i = 0; i < musicData.length; i++) {
                var frequency = musicData[i],
                    colour = COLOURS[i];
                
                if (musicData[i] > 0){
                    
                    demo.spawn( demo.touches[0].x, demo.touches[0].y, frequency * 2 , colour );
                }
                
            };
            
            

           }, 100);
            
            
        };

     
         

        

