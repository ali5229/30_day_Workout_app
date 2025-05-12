import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, View, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../context/Auth';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#a259ff",
  },
  fillShadowGradient: "#a259ff",
  fillShadowGradientOpacity: 0.2,
};

const WeightChart = () => {
  const { authData } = useAuth();
  const userId = authData?.userId;
  const [weights, setWeights] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const checkinDoc = await firestore().collection('weeklyCheckIns').doc(userId).get();

        const userData = userDoc.exists ? userDoc.data() : null;
        const checkinData = checkinDoc.exists ? checkinDoc.data() : null;

        const initialWeight = userData?.weight || 0;

        let weeklyWeights: number[] = [];

        if (checkinData) {
          const sortedWeeks = Object.keys(checkinData)
            .sort((a, b) => {
              const aNum = parseInt(a.replace('week', ''), 10);
              const bNum = parseInt(b.replace('week', ''), 10);
              return aNum - bNum;
            });

          for (let week of sortedWeeks) {
            const entries = checkinData[week];
            if (Array.isArray(entries) && entries.length > 0) {
              const latestEntry = entries[entries.length - 1];
              const weightVal = Number(latestEntry.weight);
              if (!isNaN(weightVal)) {
                weeklyWeights.push(weightVal);
              }
            }
          }
        }

        // Construct final array: initialWeight + up to 3 weekly weights
        const combinedWeights = [initialWeight, ...weeklyWeights].slice(0, 4);

        // Pad with 0s if less than 4 entries (to avoid NaN crash)
        while (combinedWeights.length < 4) {
          combinedWeights.push(0);
        }

        setWeights(combinedWeights);
      } catch (err) {
        console.error('Error fetching weights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeights();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#a259ff" style={{ marginTop: 20 }} />;
  }

  const data = {
    labels: ["Week 1", "2", "3", "4"],
    datasets: [
      {
        data: weights,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      }
    ],
  };

  const customDotProps = (value: number) => ({
    r: value === 0 ? "0" : "4", // hide dot if value is 0 (considered "missing")
    strokeWidth: "2",
    stroke: "#a259ff",
  });

  return (
    <View>
      <LineChart
        data={data}
        width={screenWidth - 16}
        height={220}
        chartConfig={{
          ...chartConfig,
          propsForDots: {}, // empty to prevent default override
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
          alignSelf: 'center',
        }}
        decorator={() => null} // disables extra point rendering
        renderDotContent={({ x, y, index, indexData }) =>
          indexData !== 0 ? (
            <View
              key={index}
              style={{
                position: 'absolute',
                top: y - 6,
                left: x - 6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#a259ff',
              }}
            />
          ) : null
        }
      />
    </View>
  );
};

export default WeightChart;
