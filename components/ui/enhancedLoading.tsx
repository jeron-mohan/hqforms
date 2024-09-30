'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function EnhancedLoading() {
  const circleVariants = {
    start: { scale: 0.8, opacity: 0.2 },
    end: { scale: 1, opacity: 1 }
  }

  const containerVariants = {
    start: { rotate: 0 },
    end: { rotate: 360, transition: { duration: 2, ease: "linear", repeat: Infinity } }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A]">
      <motion.div
        className="relative w-24 h-24"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-4 h-4 bg-white rounded-full"
            style={{
              top: `${9 * Math.sin(index * Math.PI / 4)}rem`,
              left: `${9 * Math.cos(index * Math.PI / 4)}rem`,
            }}
            variants={circleVariants}
            initial="start"
            animate="end"
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.8,
              delay: index * 0.1,
            }}
          />
        ))}
      </motion.div>
      <motion.h2
        className="mt-8 text-2xl font-bold text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Loading Survey...
      </motion.h2>
      <motion.p
        className="mt-4 text-lg text-white opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Please wait while we prepare your experience
      </motion.p>
    </div>
  )
}