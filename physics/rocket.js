import vector from "./vector";
import World from "./world";

class Rocket {
    constructor(
        position,
        rocketMass,
        fuelMass,
        rocketHeight,
        rocketRadius,
        headType, // 1, 2 ,3
        engineType, // 1, 2, 3
        temperature,
        nozzleRaduis
    ) {
        this.totalF = vector.create(0, 0);
        this.position = vector.create(position.getX(), position.getY());
        this.vilocity = vector.create(0, 0);
        this.rocketMass = rocketMass;
        this.fuelMass = fuelMass;
        this.rocketHeight = rocketHeight;
        this.rocketRadius = rocketRadius;
        this.totalMass = rocketMass + fuelMass;
        this.timeCorrection = 10;
        this.temperature = temperature;
        this.nozzleRaduis = nozzleRaduis;
        this.gravity = 0; ////
        this.angel = 0;
        this.rocketAngel = 90;
        this.t = vector.create(0, 0); ////
        this.d = vector.create(0, 0); ////
        this.l = vector.create(0, 0); ////
        this.g = vector.create(0, 0); ////
        this.setEngineType(engineType);
        this.setHeadType(headType);
        this.tVelocity = 0;
        this.maxVelocity = 0;
    }

    setEngineType(engineType) {
        if (engineType === 1) {
            // Rocketdyne F-1
            this.chamberPressure = 7000000; // pa
            this.massFlowRate = 2578; // kg/s
            this.specificImpulse = 263; // s
            this.thr = 6770000; // N
        } else if (engineType === 2) {
            // Aerojet M-1
            this.chamberPressure = 6894760; // pa
            this.massFlowRate = 1270.85; // kg/s
            this.specificImpulse = 310; // s
            this.thr = 3864800; // N
        } else if (engineType === 3) {
            // RD-170
            this.chamberPressure = 24517757; // pa
            this.massFlowRate = 2391.72; // kg/s
            this.specificImpulse = 309; // s
            this.thr = 7250000; // N
        }
    }

    setHeadType(headType) {
        if (headType === 1) {
            this.CD = 0.5; //CONE_CD
        } else if (headType === 2) {
            this.CD = 0.42; //HALF_SPHARE_CD
        } else if (headType === 3) {
            this.CD = 1.15; //SHORT_CYLINDER_CD
        }
    }

    gravity_force() {
        // W = m . g
        // return vector.create(0, -this.gravityAcceleration * this.totalMass);
        // //console.log("this.gravity", this.gravity);
        // //console.log("this.totalMass", ((this.fuelMass+this.rocketMass)));
        this.g = vector.create(
            0, -1 * (this.fuelMass + this.rocketMass) * this.gravity
        );
        // //console.log("this.g", this.g);
        // w = G . m1 . m2 / r ^ 2
        //     let weight = vector.create(this.position.getX(), this.position.getY() + World.earthRaduis);
        //     let instantaneousHeight = weight.getLength();
        //     let v = World.GravitationalConstant * World.earthMass * (this.rocketMass + this.fuelMass) / (instantaneousHeight * instantaneousHeight);
        //    this.g= vector.create(weight.getX(),weight.getY());
    }

    gravity_acceleration() {
        let instantaneousHeight = this.position.getY() + World.earthRaduis;
        let d = instantaneousHeight * instantaneousHeight;
        this.gravity = (World.GravitationalConstant * World.earthMass) / d;
        // //console.log('GravitationalConstant',World.GravitationalConstant)
        // //console.log('earthMass',World.earthMass)
        // //console.log('instantaneousHeight',instantaneousHeight)
        // //console.log('gravity',this.gravity)
    }

    exhaust_velocity() {
        return this.specificImpulse * this.gravity;
    }

    //ToDo: comment it !
    // vilocity() {
    //     // V = VE ln(m0/mf)
    //     return vector.create(0, this.engineVE * Math.log(this.totalMass / this.rocketMass));
    // }

    atm_pressure() {
        let R = 8.3145; // (J * K^−1 * mol^−1) general gases constants
        let Md = 0.028964; // (kg/mol) mass of one air molecule
        let P0 = 101325; // 1bar =100000pa
        let Tkelvin = this.temperature + 273.15;

        // Atmospheric pressure
        // p = p0 * exp(( -massOfOneAirMolecule * g * h ) / ( R * T ))
        let x = (-1 * Md * this.gravity * this.position.getY()) / (R * Tkelvin);
        // //console.log('gravity',this.gravity)
        // //console.log('height',this.position.getY())
        // //console.log('R',R)
        // //console.log('Tkelvin',Tkelvin)
        // //console.log('x',x)
        // //console.log(P0*Math.exp(x))
        return P0 * Math.exp(x); // Path : ./formulas/atm_pressure.png
    }

    air_rho() {
        let Rspecific = 287.058; //specific gas constant for dry air
        let Tkelvin = this.temperature + 273.15;
        let P = this.atm_pressure();
        // //console.log('P',P)
        // //console.log('r*t',Rspecific*Tkelvin)
        let rho = P / (Rspecific * Tkelvin); // Path: ./formulas/rho.png
        // //console.log('rho',rho)
        return rho;
    }

    drag() {
        // R = 1/2 * Cd * rho * A * V^2
        let vilocitySquared = this.vilocity.squere();
        // //console.log("vilocitySquared", vilocitySquared);
        let A = Math.PI * this.rocketRadius * this.rocketRadius;
        // //console.log("A", A);
        let rho = this.air_rho();
        // //console.log("rho", rho);
        let dx = -0.5 *
            this.CD *
            rho *
            A *
            vilocitySquared *
            this.vilocity.normalize().getX() *
            Number(Math.cos((this.rocketAngel * Math.PI) / 180).toFixed(10));
        let dy = -0.5 *
            this.CD *
            rho *
            A *
            vilocitySquared *
            this.vilocity.normalize().getY() *
            Number(Math.sin((this.rocketAngel * Math.PI) / 180).toFixed(10));

        this.d = vector.create(dx, dy);
        // //console.log('d',this.d)
    }

    // assume it's zero
    // it will be more proffesional simulation if we can calculate it
    // but in this case we wont do, because we assume that rocket maintains stability during its flight
    lift() {
        this.l = vector.create(0, 0);
    }

    thrust(dTime) {
        if (this.noFuel()) {
            // console.log("******welcom to syria, there is no fuel******");
            this.t = vector.create(0, 0);
        } else {
            // F = massFlowRate * Ve + (Pc - P0) * Ae
            let Ae = Math.PI * this.nozzleRaduis * this.nozzleRaduis;
            // //console.log('Ae', Ae)
            let P0 = this.atm_pressure();
            // //console.log('P0', P0)
            // //console.log('massFlowRate', this.massFlowRate)
            // //console.log('channelPressure', this.chamberPressure)
            // //console.log('ve',this.exhaust_velocity())
            let tx =
                (this.massFlowRate * dTime * this.exhaust_velocity() +
                    (this.chamberPressure - P0) * Ae) *
                Number(Math.cos((this.rocketAngel * Math.PI) / 180).toFixed(10));
            let ty =
                (this.massFlowRate * dTime * this.exhaust_velocity() +
                    (this.chamberPressure - P0) * Ae) *
                Number(Math.sin((this.rocketAngel * Math.PI) / 180).toFixed(10));
            // //console.log('angel', this.rocketAngel)
            // //console.log('tx', tx)
            // //console.log('ty', ty)
            this.t = vector.create(tx, ty);
        }
    }

    resetForces() {
        this.totalF = vector.create(0, 0);
    }

    totalForces(dTime) {
        this.gravity_force();
        this.thrust(dTime);
        this.drag();
        this.lift();
        // //console.log("thrust", this.t)
        // //console.log("gravity", this.g)
        // //console.log("drag", this.d)
        // //console.log("lift", this.l)
        this.totalF = this.totalF.add(this.g);
        this.totalF = this.totalF.add(this.t);
        this.totalF = this.totalF.add(this.d);
        this.totalF = this.totalF.add(this.l);
        // //console.log("totalF", this.totalF)
    }

    checkCollision() {
        if (this.position.getY() <= this.rocketHeight / 2) {
            return true;
        }
        return false;
    }

    noFuel() {
        return this.fuelMass <= 0;
    }

    maximumVelocity(fMass) {
        // v = c tanh( (Isp / c) * ln(mTotal/mRocket) )
        // console.log("fmass", fMass);
        // console.log("rMass", this.rocketMass);
        // console.log("specificImpulse", this.specificImpulse);
        // console.log("speedOfLight", World.speedOfLight);
        let r =
            (this.specificImpulse / World.speedOfLight) *
            Math.log((fMass + this.rocketMass) / this.rocketMass);
        return World.speedOfLight * 10 * Math.tanh(r);
    }

    terminalVelocity() {
        let A = Math.PI * this.rocketRadius * this.rocketRadius;
        let rho = this.air_rho();

        this.tVelocity = Math.sqrt(
            (2 * this.rocketMass * this.gravity) / (rho * A * this.CD)
        );
        // console.log("tVelocity", this.tVelocity);
    }

    isOutAthomspere() {
        return this.position.getY() > 670000;
    }

    isFreeFall() {
        return this.vilocity.getY() <= 0;
    }

    update(dTime, oldVilocity, angle, collisionFactor) {
        console.log("---------------------------------------------");
        console.log("max velocity", this.maxVelocity);
        if (this.isOutAthomspere()) {
            console.log("I'm out !!!!!!!!!");
        }
        // console.log('ra old', this.rocketAngel)
        let newAngle = angle * 5.625;
        // console.log('newAngle', newAngle)
        this.rocketAngel = 90 + newAngle;
        // console.log('ra new', this.rocketAngel)
        this.resetForces();
        this.gravity_acceleration();
        this.fuelMass = Math.max(this.fuelMass - this.massFlowRate * dTime, 0);
        this.totalForces(dTime);

        let acceleration;
        if (this.noFuel()) {
            acceleration = vector.create(
                (this.totalF.getX() / (this.fuelMass + this.rocketMass)) *
                this.timeCorrection,
                (this.totalF.getY() / (this.fuelMass + this.rocketMass)) *
                this.timeCorrection
            );
        } else {
            acceleration = vector.create(
                this.totalF.getX() / (this.fuelMass + this.rocketMass),
                this.totalF.getY() / (this.fuelMass + this.rocketMass)
            );
        }

        this.vilocity = vector.create(
            oldVilocity.getX() + acceleration.getX() * dTime,
            oldVilocity.getY() + acceleration.getY() * dTime
        );
        // if (this.vilocity.getY() >= this.maxVelocity) {
        //     this.vilocity.setX(
        //         this.maxVelocity *
        //         Number(Math.cos((this.rocketAngel * Math.PI) / 180).toFixed(2))
        //     );
        //     this.vilocity.setY(this.maxVelocity);
        // }
        // console.log("drag", this.d)
        this.position.setX(this.position.getX() + this.vilocity.getX() * dTime);
        this.position.setY(this.position.getY() + this.vilocity.getY() * dTime);

        if (this.isFreeFall()) {
            console.log("*********free fall*********");
            this.terminalVelocity();
            this.gravity_acceleration();
            console.log("grrravity", this.gravity);
            console.log('old Velocity', oldVilocity);
            this.vilocity = vector.create(
                0, //(oldVilocity.getX() - this.gravity * 100 * dTime) * Number(Math.cos((this.rocketAngel * Math.PI) / 180).toFixed(5)) * -1, //aqeel
                oldVilocity.getY() - this.gravity * 100 * dTime
            );
            // console.log("vil", this.vilocity.getY());
            if (Math.abs(this.vilocity.getY()) > Math.abs(this.tVelocity)) {
                this.vilocity.setX(
                    this.tVelocity *
                    Number(Math.cos((this.rocketAngel * Math.PI) / 180).toFixed(2))
                );

                this.vilocity.setY(-1 * this.tVelocity);
            }


            this.position.setX(this.position.getX() + this.vilocity.getX() * dTime);
            this.position.setY(this.position.getY() + this.vilocity.getY() * dTime);

            if (this.checkCollision() || this.position.getY() <= collisionFactor) {
                this.position = vector.create(
                    this.position.getX(),
                    this.rocketHeight / 2
                );
                this.totalF = vector.create(0, 0);
                this.vilocity = vector.create(0, 0);
            }
        }
    }
}

export default Rocket;