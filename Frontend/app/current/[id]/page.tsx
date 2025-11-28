import CurrentRide from "@/components/CurrentRide";

const page = ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <CurrentRide rideId={params.id} />
    </div>
  );
};

export default page;
