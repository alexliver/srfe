"use client";
import { Tooltip } from 'react-tooltip'
import { Suspense } from 'react'
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Game from './component/game';

export default function Page() {
  return (
    <Game />
  )
}

