const INITIAL_PLAYERS = [
  {
    id: '1',
    name: 'Cristiano Ronaldo',
    number: 7,
    position: 'Forward',
    age: 39,
    nationality: 'Portugal',
    rating: 91,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 88,
      sho: 93,
      pas: 80,
      dri: 85,
      def: 35,
      phy: 78
    }
  },
  {
    id: '2',
    name: 'Kevin De Bruyne',
    number: 17,
    position: 'Midfielder',
    age: 32,
    nationality: 'Belgium',
    rating: 91,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 72,
      sho: 86,
      pas: 94,
      dri: 87,
      def: 65,
      phy: 78
    }
  },
  {
    id: '3',
    name: 'Virgil van Dijk',
    number: 4,
    position: 'Defender',
    age: 32,
    nationality: 'Netherlands',
    rating: 89,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 78,
      sho: 60,
      pas: 71,
      dri: 72,
      def: 89,
      phy: 86
    }
  },
  {
    id: '4',
    name: 'Alisson Becker',
    number: 1,
    position: 'Goalkeeper',
    age: 31,
    nationality: 'Brazil',
    rating: 89,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 86,
      sho: 85,
      pas: 85,
      dri: 89,
      def: 54,
      phy: 90
    }
  },
  {
    id: '5',
    name: 'Neymar Jr',
    number: 10,
    position: 'Forward',
    age: 32,
    nationality: 'Brazil',
    rating: 88,
    status: 'Injured',
    image: 'https://images.unsplash.com/photo-1525640788966-69bdb028aa73?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 86,
      sho: 83,
      pas: 85,
      dri: 92,
      def: 37,
      phy: 61
    }
  },
  {
    id: '6',
    name: 'Luka Modrić',
    number: 10,
    position: 'Midfielder',
    age: 38,
    nationality: 'Croatia',
    rating: 87,
    status: 'Suspended',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=400',
    stats: {
      pac: 72,
      sho: 76,
      pas: 89,
      dri: 86,
      def: 72,
      phy: 66
    }
  }
];

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,OPTIONS"
    },
    body: JSON.stringify(INITIAL_PLAYERS)
  };
};
