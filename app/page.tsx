import AnimatedImage from "@/components/AnimatedImage";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  statsData,
  featuresData,
  howItWorksData,
  testimonialsData,
} from "@/data/landing";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl py-8 font-bold gradient-text">
            Manage Your Finances With Intelligence
          </h1>
        </div>
        <p className="text-gray-700 dark:text-white -mt-6 px-2">
          An AI-powered financial management platform that helps you track,
          analyze and optimize your spending with real time insights
        </p>
        <div className="space-x-2">
          <Link href={"/dashboard"}>
            <Button size={"lg"}>Get Started</Button>
          </Link>

          <Button size="lg" variant={"outline"}>
            Watch Demo
          </Button>
        </div>

        <div className=" flex items-center justify-center">
          <AnimatedImage />
        </div>
      </div>

      <div className="grid bg-blue-50 dark:bg-blue-950/50 py-20 mt-10 grid-cols-2 md:grid-cols-4 gap-8">
        {statsData.map((stat, idx) => (
          <div key={idx} className="px-2">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stat.value}
            </div>
            <div className="text-sm dark:text-white text-gray-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <p className="text-2xl sm:text-3xl mt-[70px] mb-[50px] font-bold dark:text-gray-200">
        Everything you need to manage your finances
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 container mx-auto gap-8  my-12 text-start">
        {featuresData.map((feature, idx) => (
          <div key={idx} className="px-2">
            <Card className="h-full">
              <CardContent className="flex flex-col justify-around gap-4 text-gray-600">
                {feature.icon}
                <h3 className="dark:text-gray-50">{feature.title}</h3>
                <p className="dark:text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className=" py-20  gap-8 bg-blue-50 dark:bg-blue-950/50">
        <h2 className="text-4xl font-bold mb-12 dark:text-gray-200">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorksData.map((step, idx) => (
            <div key={idx} className="px-2">
              <div className="flex flex-col justify-around gap-4 text-gray-600 dark:text-gray-400 items-center">
                <span className="w-[70px] h-[70px] rounded-full bg-blue-100 inline-flex justify-center items-center">
                  {" "}
                  {step.icon}
                </span>

                <h3 className="text-gray-800 dark:text-gray-200 font-semibold">
                  {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 container mx-auto my-28 gap-8  text-start">
        {testimonialsData.map((testimony, idx) => (
          <div key={idx} className="px-2">
            <Card >
              <CardContent className="flex flex-col justify-around gap-4 text-gray-600">
                <div className="flex gap-2 ">
                  <Image
                    src={testimony.image}
                    alt="profile image"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <section>
                    <p className="font-bold text-black dark:text-gray-200">
                      {testimony.name}
                    </p>
                    <p className="text-gray-800 dark:text-gray-300">
                      {testimony.role}
                    </p>
                  </section>
                </div>
                <p className="dark:text-gray-400">{testimony.quote}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="py-16 flex items-center flex-col gap-4 bg-blue-700 dark:bg-blue-700/30 text-white">
        <p className="text-3xl font-extrabold">
          Ready to Take Control of Your Finanaces?
        </p>
        <p>
          Join thousands of user who are already managing their finances with
          Welth
        </p>

        <Button
          size={"lg"}
          className="bg-accent p-6 hover:cursor-pointer mt-8 font-semibold text-accent-foreground animate-bounce hover:text-blue-600"
        >
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
